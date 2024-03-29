import type { PageLoad } from "./$types";
import type { EntryGenerator } from "./$types";
import type { LayoutParams, RouteParams } from "../$types";

export interface HopData {
  c_toks: string[];
  q_matches: number[][];
  c_matches: number[][];
  ranking: [number, String][];
  stage1: [number, String][];
  stage2: [number, String][];
  new_ctx: String;
}

export interface QueryData {
  query: String;
  hops: HopData[];
}

export const load: PageLoad<QueryData> = async ({ fetch, params }) => {
  const res = await fetch(`./data/${params.slug.split(".")[0]}.json`);
  const json = await res.json();
  return json;
};

export const entries: EntryGenerator = () => {
  const arr = [...Array(10).keys()].map((i) => ({
    slug: `${i}`,
  }));
  return arr;
};
