# Flipick Video Generator for WooCommerce

WordPress plugin that connects a WooCommerce store to the Flipick video adapter, lets the merchant generate product videos, and shows the
published video on the product page.

- Requires WordPress 6.2+, WooCommerce 8.0+, PHP 7.4+. Declares HPOS compatibility (never touches orders).
- **WooCommerce → Video Generator**: Connect / Disconnect / Re-sync / Refresh products, Settings, and the generator itself (framed from the adapter).
- **WooCommerce → Plans & Billing**: the adapter's billing screens.
- Products list: a **Video** column (Hero / Lifestyle / Transitions status) and a **Generate video** row action.
- Storefront: `<video>` after the product summary, or `[flipick_video id="123"]`. The video URL lives in product meta `_flipick_video_url` and `_flipick_video_thumb`.
- Connecting creates one WooCommerce REST key (Read/Write) and three signed webhooks (product created / updated / deleted); Disconnect removes them.
- Logs: `wp-content/uploads/flipick-video-generator-logs/flipick-video-generator.log` (folder closed to the web), listed and downloadable under WooCommerce → Video Generator → Logs. Rotated **every day at 00:05:00** (site timezone) and **at once when a file passes 10 MB**: the old file is zipped (`flipick-video-generator-2026-10-08.zip`, or `…-2026-10-08-153012.zip` for a size rotation) and a new one is started. Secrets are never logged. The install secret is stored encrypted (libsodium, keyed from the site's salts).
  Filters: `fvg_log_max_bytes`, `fvg_log_rotate_at`, `fvg_log_retention_days` (default 0 = keep all archives). The daily job runs on WP-Cron and is also checked on every write, so a quiet site still rotates at the next log line; for an exact 00:05 on low-traffic sites trigger `wp-cron.php` from the system cron.
  Tests: `php tests/log-rotator-test.php` (needs the PHP zip extension).

The adapter service it talks to: https://github.com/sanjaylende/WooCommerce-adaptor (which also holds the Docker dev store, `infra/woocommerce`).

## Install
Build the zip and upload it under Plugins → Add New → Upload, or copy this folder to `wp-content/plugins/flipick-video-generator`.

```bash
./bin/build-zip.sh      # -> dist/flipick-video-generator.zip
```

## Development
Mount this folder into the adapter repo's Docker store (`infra/woocommerce`) as `wp-content/plugins/flipick-video-generator`; edits show up live.
Lint: `find . -name "*.php" -print0 | xargs -0 -n1 php -l`.

## Before a marketplace submission
Needs a public HTTPS adapter address, screenshots and banner assets, and the WordPress.org / WooCommerce.com review checklists (data sent to
the adapter is listed in `readme.txt`).
