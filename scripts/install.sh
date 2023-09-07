#!/bin/bash
# Functions
AWS=`which aws`

get_parameter_store_tags() {
    echo $($AWS ssm get-parameters-by-path --with-decryption --path $1  --region $2)
}

params_to_env () {
    params=$1

    # If .Tags does not exist we assume ssm Parameteres object.
    SELECTOR="Name"

    for key in $(echo $params | /usr/bin/jq -r ".[][].${SELECTOR}"); do
                value=$(echo $params | /usr/bin/jq -r ".[][] | select(.${SELECTOR}==\"$key\") | .Value")
                key=$(echo "${key##*/}" | /usr/bin/tr ':' '' | /usr/bin/tr '-' '' | /usr/bin/tr '[:lower:]' '[:upper:]')
                echo "$key=$value"
                echo "$key=$value" >> /home/ec2-user/.env
    done
}

TAGS=$(get_parameter_store_tags "/hms/test" "us-east-1")
echo "Tags fetched via ssm from /hms/test us-east-1"

echo "creating new .env variables..."
echo '' > /home/ec2-user/.env
params_to_env "$TAGS"
cd /home/ec2-user
docker-compose -f docker-compose.yml down
docker image prune -f
docker-compose -f docker-compose.yml up -d --build