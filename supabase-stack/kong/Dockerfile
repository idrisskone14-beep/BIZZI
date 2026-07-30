FROM kong:3.9.1
COPY kong.yml /kong.yml.template
COPY docker-entrypoint.sh /bizzi-entrypoint.sh
USER root
RUN chmod +x /bizzi-entrypoint.sh \
    && mkdir -p /kong-data \
    && chown kong:kong /kong-data
USER kong
ENV KONG_DATABASE=off
ENV KONG_DECLARATIVE_CONFIG=/kong-data/kong.yml
ENV KONG_ADMIN_LISTEN=off
ENV KONG_PROXY_LISTEN=0.0.0.0:8000
ENV KONG_NGINX_WORKER_PROCESSES=1
ENV KONG_MEM_CACHE_SIZE=16m
EXPOSE 8000
ENTRYPOINT ["/bizzi-entrypoint.sh"]
