import { ValidationError } from 'auth0-extension-tools';

import DefaultHandler from './default';
import { supportedPages, pageNameMap } from './pages';
import { dumpJSON } from '../../utils';

export const schema = {
  type: 'object'
};

export default class TenantHandler extends DefaultHandler {
  constructor(options) {
    super({
      ...options,
      type: 'tenant'
    });
  }

  async getType() {
    // No need to get the current settings as you can only ever update tenant settings
    return {};
  }

  async validate(assets) {
    const { tenant } = assets;
    const blockPageKeys = [ ...Object.keys(pageNameMap), ...supportedPages ];
    const pageKeys = Object.keys(tenant).filter(k => blockPageKeys.includes(k));
    if (pageKeys.length > 0) {
      throw new ValidationError(`The following pages ${dumpJSON(pageKeys)} were found in tenant settings. Pages should be set separately. Please refer to the documentation.`);
    }
  }

  async processChanges(assets) {
    const { tenant } = assets;
    if (Object.keys(tenant).length > 0) {
      await this.client.tenant.updateSettings(tenant);
      this.updated += 1;
      this.didUpdate(tenant);
    }
  }
}
