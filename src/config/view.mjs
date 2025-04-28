import Util from '/src/config/Util';

export const args = {
  siteName: 'debiru.net',
  titleSuffix: 'debiru\'s portfolio',
  description: 'debiru\'s portfolio',
  twitter: '@debiru_R',
};

export const app = {
  init(Astro) {
    app.Astro = Astro;
    app.args = Astro.props.args ?? {};
    app.url = Astro.url;
    args.domain = app.url.hostname;
    args.path = app.url.pathname.replace(/\.html$/, '');
    args.url = app.url.origin + args.path;
    args.cssList = app.args.cssList ?? [];
    args.jsList = app.args.jsList ?? [];
    args.titlePrefix = app.args.title;
    args.title = (args.titlePrefix != null ? args.titlePrefix + ' - ' : '') + args.siteName + ' | ' + args.titleSuffix;
    args.lang = 'ja';
    args.locale = 'ja_JP';
    args.og_type = args.path === '/' ? 'website' : 'article';
    args.og_image = assetsUrl('img/global/og.png', true);
  },
};

export const rootPath = (path) => {
  path = '/' + Util.ltrim(path);
  return path;
};

export const assets = (path, cacheBuster = false) => {
  path = rootPath('assets/' + Util.ltrim(path));
  if (cacheBuster) path += '?' + Date.now();
  return path;
};

export const assetsUrl = (path, cacheBuster = false) => {
  return Util.rtrim(app.url.origin) + assets(path, cacheBuster);
};

export const img = (path) => {
  return assets('img/' + Util.ltrim(path));
};

export const route = (path) => {
  return rootPath(path);
};
