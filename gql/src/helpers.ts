import { Repository } from "typeorm";

export type Lazy<T extends object> = Promise<T> | T;

export function logFn(context: string, message: string) {
  process.stdout.write(`[${context}] ${message}\n`);
}

export function delay(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

export async function moveEntity<
  E extends { [PKF in PK]: Lazy<P> } & {
    id: string;
    idx: number;
  },
  P extends { [CKF in CK]: Lazy<E[]> } & { id: string },
  PK extends string,
  CK extends string
>(repo: Repository<E>, from: string, to: string, parentKey: PK, childKey: CK): Promise<E[]> {
  const fromEntity = await repo.findOneOrFail(from, { relations: [parentKey] });
  const toEntity = await repo.findOneOrFail(to, { relations: [parentKey] });
  const parent: P = await (fromEntity[parentKey] as Lazy<P>);
  const toParent: P = await (toEntity[parentKey] as Lazy<P>);
  if (parent.id !== toParent.id)
    throw new Error(
      `Can't move ${fromEntity.constructor.name}s between ${parent.constructor.name}s`
    );

  const entities: E[] = await (parent[childKey] as Lazy<E[]>);

  let fromIdx = null;
  let toIdx = null;
  // goes through all indices and cleans up holes while doing it
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const fromVisited = fromIdx != null;
    const toVisited = toIdx != null;

    if (fromVisited === toVisited) entity.idx = i;
    else if (fromVisited) entity.idx = i - 1;
    else if (toVisited) entity.idx = i + 1;

    if (entity.id === from) {
      if (toVisited) entity.idx = toIdx!;
      fromIdx = i;
    }

    if (entity.id === to) {
      if (fromVisited) entities[fromIdx!].idx = i;
      else entity.idx = i + 1;
      toIdx = i;
    }
  }

  console.log(entities.map(e => e.idx));

  // @ts-ignore
  return repo.save<E>(entities);
}
