    notes
        - all sources must be in 720p30fps or 1080p30fps mp4 format
        - mts conversion required to maintain concat timeframe sync 

## cfv / ffmpeg commands

1. extract section of raw video for given timestamps in `[hh:mm:ss]`
    ```sh
    node cfv --command extract --from ./source/hangouts-raw.smp4 --begin [BEGIN] --end [END] --to ./source/hangouts-extract.mp4
    ```
    ```sh
    ffmpeg -ss [START] -i ./source/hangouts-raw.mp4 -t [LENGTH] -vcodec copy -acodec copy ./source/hangouts-extract.mp4
    ```

2. convert hangouts-extracted video to `mts`
    ```sh
    node cfv --command v2mts --from ./source/hangouts-raw.mp4 --to ./merge/record.mts
    ```
    ```sh
    ffmpeg -i ./source/hangouts-extracted.mp4 -q 0 ./merge/record.mts
    ```


3. convert intro video to `mts`
    convert hangouts-extracted video to `mts`
    ```sh
    node cfv --command v2mts --from ./source/intro.mp4 --to ./merge/intro.mts
    ```
    ```sh 
    ffmpeg -i ./source/intro.mp4 -q 0 ./merge/intro.mts
    ```


4. generate target file list, `files.txt`
    ```sh
    node cfv --command genlist --from ./merge/*.mts --to ./merge/files.txt
    ```
    ```sh
    rm files.txt
    for f in ./merge/*.mts; do echo "file '$f'" >> files.txt; done
    ```


5. concat target mts clips in `output.mts`
    ```sh
    node cfv --command concat --from ./merge/files.txt --to ./output/output.mts
    ```
    ```sh
    ffmpeg -f concat -i ./merge/files.txt -c copy ./output/output.mts
    ```


6. convert output to `mp4`
    ```sh
    node cfv --command v2mp4 --from ./output/output.mts --to ./output/output.mp4
    ```
    ```sh
    ffmpeg -i ./output/output.mts -c:v copy -c:a aac ./output/output.mp4
    ```

