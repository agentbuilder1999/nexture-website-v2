#!/bin/bash
set -euo pipefail

##############################################################################
# AWS Bedrock Model Connectivity Test Script
# 检测 claude-opus-4-6-v1 和 claude-sonnet-4-6 的响应状态
##############################################################################

# 配置
REGION="${AWS_REGION:-us-east-1}"
OUTPUT_FILE="/tmp/bedrock-test-$(date +%s).json"

# 模型列表
declare -a MODELS=(
    "anthropic.claude-opus-4-6-v1"
    "anthropic.claude-sonnet-4-6"
)

# 结果数组
declare -a RESULTS=()

echo "════════════════════════════════════════════════════════════════"
echo "🔍 AWS Bedrock Model Connectivity Test"
echo "════════════════════════════════════════════════════════════════"
echo "Region: $REGION"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 检查 AWS CLI 和认证
if ! command -v aws &> /dev/null; then
    echo "✗ ERROR: aws CLI not found"
    exit 1
fi

# 验证 AWS 认证
if ! aws sts get-caller-identity --region "$REGION" &>/dev/null; then
    echo "✗ ERROR: AWS authentication failed"
    exit 1
fi

echo "✓ AWS authentication OK"
echo ""

##############################################################################
# 函数：测试单个模型
##############################################################################
test_model() {
    local model_id="$1"
    local model_name="${model_id#anthropic.}"
    
    echo -n "Testing [$model_name] ... "
    
    local start_time=$(date +%s%N)
    local http_status=""
    local error_msg=""
    local response_body=""
    local connection_status="FAIL"
    
    # 构建 Bedrock API 请求（使用 converse API）
    local payload=$(cat <<EOF
{
    "messages": [
        {
            "role": "user",
            "content": "Respond with OK"
        }
    ],
    "model": "$model_id",
    "max_tokens": 100
}
EOF
)
    
    # 调用 Bedrock converse API 并捕获状态
    response_body=$(aws bedrock-runtime converse \
        --region "$REGION" \
        --model-id "$model_id" \
        --messages '[{"role":"user","content":[{"text":"Respond with OK"}]}]' \
        --max-tokens 100 \
        2>&1 || true)
    
    http_status=$?
    
    local end_time=$(date +%s%N)
    local response_time_ms=$(( (end_time - start_time) / 1000000 ))
    
    # 判断连接状态
    if [[ $http_status -eq 0 ]]; then
        connection_status="OK"
        echo "✓ OK ($response_time_ms ms)"
    else
        # 尝试提取错误信息
        error_msg=$(echo "$response_body" | grep -oP '"message"\s*:\s*"\K[^"]+' | head -1)
        if [[ -z "$error_msg" ]]; then
            error_msg=$(echo "$response_body" | head -1)
        fi
        echo "✗ FAIL"
    fi
    
    # 保存结果
    RESULTS+=("$model_name|$connection_status|$http_status|$error_msg|$response_time_ms")
}

##############################################################################
# 测试所有模型
##############################################################################
for model in "${MODELS[@]}"; do
    test_model "$model"
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📊 Test Results"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Model Name | Status | HTTP Code | Error Message | Response Time (ms)"
echo "-----------|--------|-----------|---------------|-------------------"

for result in "${RESULTS[@]}"; do
    IFS='|' read -r name status http_code error_msg response_time <<< "$result"
    
    # 格式化输出
    if [[ "$status" == "OK" ]]; then
        printf "%-25s | %-6s | %-9s | %-45s | %s ms\n" \
            "$name" "$status" "$http_code" "N/A" "$response_time"
    else
        # 截断错误消息
        error_short=$(echo "$error_msg" | cut -c1-45)
        printf "%-25s | %-6s | %-9s | %-45s | %s ms\n" \
            "$name" "$status" "$http_code" "$error_short" "$response_time"
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"

# 统计通过/失败
pass_count=$(echo "${RESULTS[@]}" | grep -o "OK" | wc -l)
fail_count=$((${#RESULTS[@]} - pass_count))

echo "Summary: $pass_count passed, $fail_count failed"
echo ""

# 生成 JSON 输出
echo "Generating JSON report: $OUTPUT_FILE"
python3 << PYSCRIPT
import json
from datetime import datetime

results_data = []
results_raw = """${RESULTS[@]}"""

for line in results_raw.split('\n'):
    if not line.strip():
        continue
    parts = line.split('|')
    if len(parts) >= 5:
        results_data.append({
            'model': parts[0].strip(),
            'status': parts[1].strip(),
            'http_code': int(parts[2].strip()) if parts[2].strip().isdigit() else None,
            'error_message': parts[3].strip() if parts[3].strip() else None,
            'response_time_ms': int(parts[4].strip()) if parts[4].strip().isdigit() else None
        })

output = {
    'timestamp': datetime.now().isoformat(),
    'region': '$REGION',
    'results': results_data
}

with open('$OUTPUT_FILE', 'w') as f:
    json.dump(output, f, indent=2)

print(f"✓ JSON report saved to: $OUTPUT_FILE")
PYSCRIPT

exit $([ $fail_count -eq 0 ] && echo 0 || echo 1)
