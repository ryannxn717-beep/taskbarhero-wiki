import { error } from '@sveltejs/kit';
import { resolveContentRoute } from '$lib/content/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) => {
  const path = `/${params.path ?? ''}`;
  const model = resolveContentRoute(path);
  if (!model) error(404, { message: 'Database entry not found' });
  return { title: model.title, model, query: url.searchParams.toString() };
};
