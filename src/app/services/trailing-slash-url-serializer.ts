import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';

export class TrailingSlashUrlSerializer implements UrlSerializer {
  private readonly base = new DefaultUrlSerializer();

  parse(url: string): UrlTree {
    return this.base.parse(url);
  }

  serialize(tree: UrlTree): string {
    const url = this.base.serialize(tree);
    const queryStart = url.search(/[?#]/);
    const path = queryStart === -1 ? url : url.slice(0, queryStart);
    const suffix = queryStart === -1 ? '' : url.slice(queryStart);
    return path.endsWith('/') ? url : path + '/' + suffix;
  }
}
