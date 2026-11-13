ARG SEED_ELGG_IMAGE=handsonsecurity/seed-elgg:original-arm
FROM ${SEED_ELGG_IMAGE}
COPY lab/config/settings.php /var/www/elgg/elgg-config/settings.php
COPY lab/config/apache.conf /etc/apache2/sites-available/000-default.conf
COPY lab/scripts/patch-csrf.php /opt/lab/patch-csrf.php
COPY lab/scripts/entrypoint.sh /opt/lab/entrypoint.sh
COPY lab/scripts/initialize.php lab/scripts/profile.php lab/scripts/version.php /opt/lab/
# Fail closed if the upstream method signature changes.
RUN php /opt/lab/patch-csrf.php && a2enmod rewrite && chmod +x /opt/lab/entrypoint.sh
ENTRYPOINT ["/opt/lab/entrypoint.sh"]
