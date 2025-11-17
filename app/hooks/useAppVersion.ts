import { useState, useEffect } from "react";

interface UseAppVersionOptions {
  repoOwner?: string;
  repoName?: string;
  cacheKey?: string;
  refreshInterval?: number;
}

export function useAppVersion(options: UseAppVersionOptions = {}) {
  const {
    repoOwner = "skygenesisenterprise",
    repoName = "aether-mail",
    cacheKey = "aether-mail-version",
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [version, setVersion] = useState<string>("v0.0.0");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Méthode 1: Essayer package.json local
      try {
        const packageResponse = await fetch("/package.json");
        if (packageResponse.ok) {
          const packageData = await packageResponse.json();
          if (packageData.version) {
            const versionString = `v${packageData.version}`;
            setVersion(versionString);
            localStorage.setItem(cacheKey, versionString);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log("Package.json non disponible:", e);
      }

      // Méthode 2: API GitHub - dernière release
      try {
        const githubResponse = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (githubResponse.ok) {
          const releaseData = await githubResponse.json();
          if (releaseData.tag_name) {
            setVersion(releaseData.tag_name);
            localStorage.setItem(cacheKey, releaseData.tag_name);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log("API GitHub releases non disponible:", e);
      }

      // Méthode 3: API GitHub - dernier commit
      try {
        const commitResponse = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/commits/main`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (commitResponse.ok) {
          const commitData = await commitResponse.json();
          if (commitData.sha) {
            const shortSha = commitData.sha.substring(0, 7);
            const versionString = `dev-${shortSha}`;
            setVersion(versionString);
            localStorage.setItem(cacheKey, versionString);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log("API GitHub commits non disponible:", e);
      }

      // Méthode 4: Version depuis le cache
      const cachedVersion = localStorage.getItem(cacheKey);
      if (cachedVersion) {
        setVersion(cachedVersion);
        setIsLoading(false);
        return;
      }

      // Si aucune méthode ne fonctionne
      setVersion("v0.0.0");
      setError("Impossible de récupérer la version");
    } catch (err) {
      console.error("Erreur lors de la récupération de la version:", err);
      setError("Erreur de récupération");
      setVersion("v0.0.0");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersion();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchVersion, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [repoOwner, repoName, cacheKey, refreshInterval]);

  return {
    version,
    isLoading,
    error,
    refetch: fetchVersion,
  };
}
