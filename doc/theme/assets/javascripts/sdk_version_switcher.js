(() => {
  const STORAGE_KEY = "ecos.sdk.version";
  const DEFAULT_VERSION = "2.0";
  const SDK_ROOT_SEGMENTS = ["page", "sdk"];
  const SDK_VERSIONS = {
    "1.0": {
      segment: "v1.0",
    },
    "2.0": {
      segment: "v2.0",
    },
    "3.0": {
      segment: "v3.0",
    },
  };

  const findPrimaryNav = () =>
    document.querySelector(".md-sidebar.md-sidebar--primary .md-nav--primary");

  const isSdkVersion = (version) =>
    version === "1.0" || version === "2.0" || version === "3.0";

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
    if (pathname.endsWith("/index.html")) {
      pathname = pathname.slice(0, -"index.html".length);
    }
    if (pathname.length > 1 && pathname.endsWith("/")) {
      return pathname.slice(0, -1);
    }
    return pathname;
  };

  const splitPathSegments = (pathname) => normalizePathname(pathname).split("/").filter(Boolean);

  const buildPathFromSegments = (segments, trailingSlash = false) => {
    if (!segments.length) return "/";
    const path = `/${segments.join("/")}`;
    return trailingSlash ? `${path}/` : path;
  };

  const getSdkPathInfo = (pathname) => {
    const segments = splitPathSegments(pathname);

    for (let index = 0; index <= segments.length - SDK_ROOT_SEGMENTS.length; index += 1) {
      const matchesRoot = SDK_ROOT_SEGMENTS.every((segment, offset) => segments[index + offset] === segment);
      if (!matchesRoot) continue;

      const prefixSegments = segments.slice(0, index);
      const trailingSegments = segments.slice(index + SDK_ROOT_SEGMENTS.length);
      const rootSegments = [...prefixSegments, ...SDK_ROOT_SEGMENTS];

      return {
        prefixSegments,
        trailingSegments,
        rootPath: buildPathFromSegments(rootSegments),
        rootPathWithSlash: buildPathFromSegments(rootSegments, true),
      };
    }

    return null;
  };

  const isSdkPath = (pathname) => Boolean(getSdkPathInfo(pathname));

  const isSdkLandingPath = (pathname) => {
    const sdkPath = getSdkPathInfo(pathname);
    return Boolean(sdkPath) && sdkPath.trailingSegments.length === 0;
  };

  const getVersionFromPath = (pathname) => {
    const sdkPath = getSdkPathInfo(pathname);
    if (!sdkPath) return null;

    const [scope] = sdkPath.trailingSegments;
    if (!scope) return "overview";
    if (scope === SDK_VERSIONS["1.0"].segment) return "1.0";
    if (scope === SDK_VERSIONS["2.0"].segment) return "2.0";
    if (scope === SDK_VERSIONS["3.0"].segment) return "3.0";
    if (scope === "common") return "common";
    if (scope === "templates") return "2.0";

    // Legacy unversioned SDK pages belong to the 2.x documentation set.
    return "2.0";
  };

  const isVersionScopedPath = (pathname) => isSdkVersion(getVersionFromPath(pathname));

  const getStoredVersion = () => {
    const version = window.localStorage?.getItem(STORAGE_KEY);
    return isSdkVersion(version) ? version : null;
  };

  const setStoredVersion = (version) => {
    if (!isSdkVersion(version)) return;
    window.localStorage?.setItem(STORAGE_KEY, version);
  };

  const buildVersionRootPath = (pathname, targetVersion) => {
    const sdkPath = getSdkPathInfo(pathname);
    if (!sdkPath || !SDK_VERSIONS[targetVersion]) return pathname;

    return buildPathFromSegments(
      [...sdkPath.prefixSegments, ...SDK_ROOT_SEGMENTS, SDK_VERSIONS[targetVersion].segment],
      true
    );
  };

  const resolveCurrentVersion = (pathname) => {
    const inferred = getVersionFromPath(pathname);
    if (isSdkVersion(inferred)) return inferred;
    return getStoredVersion() || getActiveVersion() || DEFAULT_VERSION;
  };

  const findVersionNavItems = (primaryNav) => ({
    "1.0": primaryNav.querySelector('.md-nav__item[data-sdk-version="1.0"]'),
    "2.0": primaryNav.querySelector('.md-nav__item[data-sdk-version="2.0"]'),
    "3.0": primaryNav.querySelector('.md-nav__item[data-sdk-version="3.0"]'),
  });

  const setNavVisibility = (item, visible) => {
    if (!item) return;
    item.hidden = !visible;
    item.setAttribute("aria-hidden", visible ? "false" : "true");
  };

  const applyNavVisibility = (primaryNav, version) => {
    const navItems = findVersionNavItems(primaryNav);
    if (!navItems["1.0"] && !navItems["2.0"] && !navItems["3.0"]) return false;

    setNavVisibility(navItems["1.0"], version === "1.0");
    setNavVisibility(navItems["2.0"], version === "2.0");
    setNavVisibility(navItems["3.0"], version === "3.0");
    return true;
  };

  const clearVersionState = (primaryNav) => {
    delete document.documentElement.dataset.sdkNavVersion;
    if (primaryNav) {
      delete primaryNav.dataset.sdkCurrentVersion;
      const navItems = findVersionNavItems(primaryNav);
      Object.values(navItems).forEach((item) => setNavVisibility(item, true));
    }
  };

  const updateExistingSelect = (container, currentVersion) => {
    const select = container?.querySelector("select");
    if (!select) return;
    if (select.value !== currentVersion) select.value = currentVersion;
  };

  const getNavigationIntentVersion = (pathname) => {
    if (!isSdkPath(pathname) || isSdkLandingPath(pathname)) return null;

    const inferred = getVersionFromPath(pathname);
    if (isSdkVersion(inferred)) return inferred;

    return getStoredVersion() || getActiveVersion() || DEFAULT_VERSION;
  };

  const render = () => {
    const primaryNav = findPrimaryNav();
    if (!primaryNav) return;

    const pathname = window.location.pathname || "/";
    const existing = document.getElementById("ecos-sdk-version-switcher");

    // The version UI is only emitted for the Chinese SDK navigation.
    if (primaryNav.dataset.sdkContext !== "sdk") {
      if (existing) existing.style.display = "none";
      clearVersionState(primaryNav);
      return;
    }

    if (!isSdkPath(pathname)) {
      if (existing) existing.style.display = "none";
      clearVersionState(primaryNav);
      return;
    }

    if (isSdkLandingPath(pathname)) {
      if (existing) existing.style.display = "none";

      const landingVersion = getStoredVersion() || getActiveVersion() || DEFAULT_VERSION;
      applyVersionState(landingVersion);
      applyNavVisibility(primaryNav, landingVersion);
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

    if (!existing) return;

    existing.style.display = "";
    updateExistingSelect(existing, currentVersion);

    const select = existing.querySelector("select");
    if (select && !select.dataset.bound) {
      select.dataset.bound = "true";
      select.addEventListener("change", (e) => {
        const targetVersion = e.target?.value;
        if (!isSdkVersion(targetVersion)) return;

        setStoredVersion(targetVersion);
        applyVersionState(targetVersion);

        const current = getVersionFromPath(window.location.pathname || "/");
        if (isSdkVersion(current) && current !== targetVersion) {
          const nextPath = buildVersionRootPath(window.location.pathname || "/", targetVersion);
          window.location.assign(`${nextPath}${window.location.search || ""}`);
          return;
        }

        render();
      });
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

    // Material for MkDocs emits document$ during instant navigation.
    if (typeof document$ !== "undefined") {
      document$.subscribe(() => {
        render();
      });
    }

    const observer = new MutationObserver(() => {
      render();
    });

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
