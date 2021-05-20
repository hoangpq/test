container=$(docker run -d -it \
--mount type=bind,source="$(pwd)"/upload,target=/usr/src/app/upload \
--mount type=bind,source="$(pwd)"/test,target=/usr/src/app/test \
yt-upload)

docker logs $container -f
