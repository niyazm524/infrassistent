import * as fs from 'fs';
import * as path from 'path';
import { uuid } from 'systeminformation';
import { LogSourceSerialized } from './logs/types';

type ISettings = {
  account: null | {
    token: string;
    url: string;
    id: string;
  };
  logs: LogSourceSerialized[];
};

type SettingsManagement = {
  path: string;
  load: () => Promise<ISettings>;
  save: () => Promise<void>;
};

const defaultSettings: ISettings = {
  account: {
    token: '',
    url: 'http://localhost:3004',
    id: null,
  },
  logs: [],
};

export const settings: ISettings & { $: SettingsManagement } = {
  account: null,
  logs: [],

  $: {
    path: path.resolve(process.cwd(), 'settings.json'),
    load: async () => {
      try {
        const loaded: ISettings = JSON.parse(
          await fs.promises.readFile(settings.$.path, { encoding: 'utf-8' })
        );
        Object.assign(settings, loaded);
        return loaded;
      } catch (e) {
        const defaults: ISettings = JSON.parse(JSON.stringify(defaultSettings));
        defaults.account.id = (await uuid()).os;
        Object.assign(settings, defaults);
        return defaults;
      }
    },
    save: async () => {
      const { $, ...s } = settings;
      await fs.promises.writeFile(settings.$.path, JSON.stringify(s, null, 4), {
        encoding: 'utf-8',
      });
    },
  },
};
