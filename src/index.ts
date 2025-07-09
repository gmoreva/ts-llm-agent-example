import { selectEntrypoint } from './entrypoint/selector';
import 'dotenv/config';

selectEntrypoint().then((entrypoint) => {
  entrypoint.run()
});