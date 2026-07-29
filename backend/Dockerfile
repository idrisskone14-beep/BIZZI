FROM denoland/deno:alpine-2.1.4

WORKDIR /app
COPY index.ts .

RUN deno cache index.ts

EXPOSE 8000
CMD ["deno", "run", "--allow-net", "--allow-env", "index.ts"]
