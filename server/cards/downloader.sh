#!/usr/bin/env bash
MAX_RATE=15
lastDownloaded=0
currentTimestamp=0

update_timestamp() {
    currentTimestamp=$(date +'%s')
}

cd pics/
downloaded=0
update_timestamp
# while rl= read -r line; do
while true; do
    if [ $lastDownloaded -ge $currentTimestamp ]; then
        update_timestamp
        continue
    fi

    if [ $downloaded -lt $MAX_RATE ]; then
        read -r line
        if [ $? -ne 0 ]; then
            break
        fi
        paths[$downloaded]=$line
        downloaded=$(( $downloaded + 1 ))
    else
        downloaded=0
        update_timestamp
        wget -q ${paths[@]}
        unset paths
    fi
done < '../pics_urls.txt'
echo 'Remaining' ${paths[@]}
wget -q ${paths[@]}

