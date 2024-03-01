import type { PageLoad } from "./$types";

export interface HopData {
  c_toks: string[],
  q_matches: number[][], 
  c_matches: number[][],
  ranking: [number, String][],
  stage1: [number, String][],
  stage2: [number, String][],
  new_ctx: String,
}

export interface QueryData {
  query: String;
  hops: HopData[];
}

export const load: PageLoad<QueryData> = async ({ fetch, params }) => {
  const res = await fetch(`/data/${params.slug}.json`);
  const json = await res.json();
  return json;
};
