(() => {
  const SDK_ROOT_PATH = "/page/sdk";
  const SDK_COMMON_PATH = "/page/sdk/common";
  const STORAGE_KEY = "ecos.sdk.version";
  const DEFAULT_VERSION = "2.0";
  const SDK_VERSIONS = {
    "1.0": {
      path: "/page/sdk/v1.0",
    },
    "2.0": {
      path: "/page/sdk/v2.0",
    },
  };
  const SDK_PAGE_MAP = {
    gpio: { "1.0": "gpio", "2.0": "gpio_v2" },
    qspi: { "1.0": "qspi" },
    pwm: { "1.0": "pwm" },
    hp_uart: { "1.0": "hp_uart" },
    i2c: { "1.0": "i2c" },
    sys_uart: { "1.0": "sys_uart", "2.0": "sys_uart_v2" },
    timer: { "1.0": "timer" },
    libc: { "1.0": "libc" },
    libgcc: { "1.0": "libgcc" },
    hello_world: { "1.0": "hello_world" },
  };
  const SLUG_TO_PAGE_KEY = Object.entries(SDK_PAGE_MAP).reduce((index, [pageKey, versions]) => {
    for (const slug of Object.values(versions)) {
      index[slug] = pageKey;
    }
    return index;
  }, {});

  const findPrimaryNav = () =>
    document.querySelector(".md-sidebar.md-sidebar--primary .md-nav--primary");

  const isSdkVersion = (version) => version === "1.0" || version === "2.0";

  const getActiveVersion = () => {
    const docVersion = document.documentElement.dataset.sdkNavVersion;
    if (isSdkVersion(docVersion)) return docVersion;

    const navVersion = findPrimaryNav()?.dataset.sdkCurrentVersion;
    if (isSdkVersion(navVersion)) return navVersion;

    return null;
  };

  const applyVersionState = (version) => {
    if (!isSdkVersion(version)) return;

    document.documentElement.dataset.sdkNavVersion = version;

    const primaryNav = findPrimaryNav();
    if (primaryNav) {
      primaryNav.dataset.sdkCurrentVersion = version;
    }
  };

  const normalizePathname = (pathname) => {
    if (!pathname) return "/";
    if (pathname.length > 1 && pathname.endsWith("/")) {
      return pathname.slice(0, -1);
    }
    return pathname;
  };

  const matchesPathPrefix = (pathname, prefix) => {
    const normalizedPathname = normalizePathname(pathname);
    const normalizedPrefix = normalizePathname(prefix);
    return normalizedPathname === normalizedPrefix || normalizedPathname.startsWith(`${normalizedPrefix}/`);
  };

  const isSdkPath = (pathname) => matchesPathPrefix(pathname, SDK_ROOT_PATH);

  const getVersionFromPath = (pathname) => {
    for (const [version, { path }] of Object.entries(SDK_VERSIONS)) {
      if (matchesPathPrefix(pathname, path)) {
        return version;
      }
    }

    if (matchesPathPrefix(pathname, SDK_COMMON_PATH)) {
      return "common";
    }

    return "common";
  };

  const isVersionScopedPath = (pathname) => {
    const version = getVersionFromPath(pathname);
    return version === "1.0" || version === "2.0";
  };

  const getStoredVersion = () => {
    const v = window.localStorage?.getItem(STORAGE_KEY);
    return v === "1.0" || v === "2.0" ? v : null;
  };

  const setStoredVersion = (version) => {
    if (version !== "1.0" && version !== "2.0") return;
    window.localStorage?.setItem(STORAGE_KEY, version);
  };

  const getSdkRootPath = (pathname) => {
    const normalizedPathname = normalizePathname(pathname);
    const idx = normalizedPathname.indexOf(SDK_ROOT_PATH);
    if (idx === -1) return `${SDK_ROOT_PATH}/`;
    return `${normalizedPathname.slice(0, idx)}${SDK_ROOT_PATH}/`;
  };

  const getVersionedSlug = (pathname) => {
    const version = getVersionFromPath(pathname);
    const versionPath = SDK_VERSIONS[version]?.path;
    if (!versionPath) return null;

    const normalizedPathname = normalizePathname(pathname);
    const rest = normalizedPathname.slice(normalizedPathname.indexOf(versionPath) + versionPath.length);
    return rest.split("/").filter(Boolean)[0] || null;
  };

  const buildTargetPath = (pathname, targetVersion) => {
    if (!isVersionScopedPath(pathname)) {
      return pathname;
    }

    const currentSlug = getVersionedSlug(pathname);
    const pageKey = currentSlug ? SLUG_TO_PAGE_KEY[currentSlug] : null;
    const nextSlug = pageKey ? SDK_PAGE_MAP[pageKey]?.[targetVersion] : null;

    if (!nextSlug) {
      return getSdkRootPath(pathname);
    }

    const normalizedPathname = normalizePathname(pathname);
    const prefix = normalizedPathname.slice(0, normalizedPathname.indexOf(SDK_ROOT_PATH));
    return `${prefix}${SDK_VERSIONS[targetVersion].path}/${nextSlug}/`;
  };

  const resolveCurrentVersion = (pathname) => {
    const inferred = getVersionFromPath(pathname);
    if (inferred === "1.0" || inferred === "2.0") return inferred;
    return getStoredVersion() || getActiveVersion() || DEFAULT_VERSION;
  };

  const classifyVersionItem = (item) => {
    const markedVersion = item.getAttribute("data-sdk-version");
    if (markedVersion === "1.0" || markedVersion === "2.0") {
      return markedVersion;
    }

    const hrefs = Array.from(item.querySelectorAll("a[href]"))
      .map((link) => link.pathname || "")
      .filter((pathname) => pathname && pathname !== "/");

    const hasV1 = hrefs.some((pathname) => matchesPathPrefix(pathname, SDK_VERSIONS["1.0"].path));
    const hasV2 = hrefs.some((pathname) => matchesPathPrefix(pathname, SDK_VERSIONS["2.0"].path));

    if (hasV1 && !hasV2) return "1.0";
    if (hasV2 && !hasV1) return "2.0";
    return null;
  };

  const findSdkNavItem = (primaryNav) => {
    const items = Array.from(primaryNav.querySelectorAll(":scope > .md-nav__list > .md-nav__item"));

    for (const item of items) {
      const directLink = item.querySelector(":scope > .md-nav__link, :scope > .md-nav__container > .md-nav__link");
      const pathname = directLink?.pathname || "";
      if (matchesPathPrefix(pathname, SDK_ROOT_PATH)) {
        return item;
      }
    }

    return null;
  };

  const findVersionNavItems = (primaryNav) => {
    const markedV1 = primaryNav.querySelector('.md-nav__item[data-sdk-version="1.0"]');
    const markedV2 = primaryNav.querySelector('.md-nav__item[data-sdk-version="2.0"]');
    if (markedV1 || markedV2) {
      return { "1.0": markedV1, "2.0": markedV2 };
    }

    const result = { "1.0": null, "2.0": null };
    const sdkNavItem = findSdkNavItem(primaryNav);
    if (!sdkNavItem) return result;

    const items = Array.from(sdkNavItem.querySelectorAll(":scope > nav.md-nav > ul.md-nav__list > li.md-nav__item"));

    for (const item of items) {
      const version = classifyVersionItem(item);
      if (version) result[version] = item;
      if (result["1.0"] && result["2.0"]) break;
    }

    return result;
  };

  const setNavVisibility = (item, visible) => {
    if (!item) return;
    item.hidden = !visible;
    item.setAttribute("aria-hidden", visible ? "false" : "true");
  };

  const applyNavVisibility = (primaryNav, version) => {
    const navItems = findVersionNavItems(primaryNav);
    if (!navItems["1.0"] && !navItems["2.0"]) return false;

    setNavVisibility(navItems["1.0"], version === "1.0");
    setNavVisibility(navItems["2.0"], version === "2.0");
    return true;
  };

  const updateExistingSelect = (container, currentVersion) => {
    const select = container?.querySelector("select");
    if (!select) return;
    if (select.value !== currentVersion) select.value = currentVersion;
  };

  const getNavigationIntentVersion = (pathname) => {
    if (!isSdkPath(pathname)) return null;

    const inferred = getVersionFromPath(pathname);
    if (isSdkVersion(inferred)) return inferred;

    return getStoredVersion() || getActiveVersion() || DEFAULT_VERSION;
  };

  const render = () => {
    const primaryNav = findPrimaryNav();
    if (!primaryNav) return;

    const pathname = window.location.pathname || "/";
    const existing = document.getElementById("ecos-sdk-version-switcher");

    if (!isSdkPath(pathname)) {
      if (existing) existing.style.display = "none";
      return;
    }

    const currentVersion = resolveCurrentVersion(pathname);
    setStoredVersion(currentVersion);
    applyVersionState(currentVersion);

    const hasVersionNav = applyNavVisibility(primaryNav, currentVersion);
    if (!hasVersionNav) {
      if (existing) existing.style.display = "none";
      return;
    }

    if (existing) {
      existing.style.display = "";
      updateExistingSelect(existing, currentVersion);

      const select = existing.querySelector("select");
      if (select) {
        if (!select.dataset.bound) {
          select.dataset.bound = "true";
          select.addEventListener("change", (e) => {
            const targetVersion = e.target?.value;
            if (targetVersion !== "1.0" && targetVersion !== "2.0") return;

            setStoredVersion(targetVersion);
            applyVersionState(targetVersion);
            const nextPath = buildTargetPath(window.location.pathname || "/", targetVersion);
            if (nextPath === (window.location.pathname || "/")) {
              render();
              return;
            }

            const nextUrl = `${nextPath}${window.location.search || ""}${window.location.hash || ""}`;
            window.location.assign(nextUrl);
          });
        }
      }
    }
  };

  const primeNavigationVersion = (event) => {
    const link = event.target?.closest?.("a[href]");
    if (!link || link.origin !== window.location.origin) return;

    const nextVersion = getNavigationIntentVersion(link.pathname || "");
    if (nextVersion) {
      applyVersionState(nextVersion);
    }
  };

  const boot = () => {
    render();
    document.addEventListener("click", primeNavigationVersion, true);

    // Material for MkDocs emits custom events during instant navigation
    // document$ is an Observable provided by the theme
    if (typeof document$ !== "undefined") {
      document$.subscribe(() => {
        render();
      });
    }

    // Fallback mutation observer to handle dynamic changes
    const observer = new MutationObserver(() => {
      render();
    });

    // Observe the main content area instead of documentElement to avoid over-triggering,
    // or keep observing the sidebar area where the element needs to live.
    const sidebarContainer = document.querySelector(".md-sidebar.md-sidebar--primary");
    if (sidebarContainer) {
      observer.observe(sidebarContainer, { subtree: true, childList: true });
    } else {
      observer.observe(document.documentElement, { subtree: true, childList: true });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
