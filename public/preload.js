(function() {
  const path = window.location.pathname;
  const excludedPaths = ['/contact', '/prikbord', '/wieheeftsale', '/ambassador'];
  const shouldSkip = excludedPaths.some(excluded => path === excluded || path.startsWith(excluded + '/'));

  if (shouldSkip) {
    console.log('Preload skipped for path:', path);
    return;
  }

  fetch('manifest.json')
    .then(response => response.json())
    .then(manifest => {
      const jsonFile = manifest.latestDiscounts;
      if (jsonFile) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'fetch';
        link.href = jsonFile;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    })
    .catch(err => console.error('Could not load manifest.json:', err));
})();
