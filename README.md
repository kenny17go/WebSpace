# WebSpace

**Your web apps, one workspace.**

WebSpace is a lightweight, configuration-driven launcher for independent web apps. Each app remains separately deployed; WebSpace only loads it when opened.

## Add an app
Edit `apps.json` and add an object with `id`, `name`, `description`, `category`, `icon`, `tint`, and `url`.

## V1
- Responsive app launcher
- Categories and search
- Lazy iframe loading
- Full-screen app viewer
- External-open fallback button
- PWA manifest

> Some sites block iframe embedding through security headers. Use the ↗ button to open those apps directly.
