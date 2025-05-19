import React from "react";

function isOneOf(value: unknown): value is SlotsConfigOneOf {
	return Boolean(value && typeof value === "object" && "oneOf" in value && Array.isArray(value.oneOf));
}

function isManyOf(value: unknown): value is SlotsConfigManyOf {
	return Boolean(value && typeof value === "object" && "manyOf" in value && Array.isArray(value.manyOf));
}

export function makeSlots<Config extends SlotsConfig>(children: React.ReactNode, config: Config): Slots<Config> {
	const configEntries = Object.entries(config);

	let fallbackKey: undefined | string = undefined;

	const tags = new Set<string>();
	const components = new WeakSet<React.JSXElementConstructor<unknown>>();

	function addTag(tag: SetValue<typeof tags>) {
		if (tags.has(tag)) {
			throw new Error(`cannot register the same tag multiple times: ${tag}`);
		}
		tags.add(tag);
	}

	function addComponent(component: SetValue<typeof components>) {
		if (components.has(component)) {
			throw new Error(`cannot register the same component multiple times: ${component}`);
		}
		components.add(component);
	}

	function addEntry(value: SetValue<typeof tags | typeof components>) {
		if (typeof value === "string") {
			addTag(value);
		} else {
			addComponent(value);
		}
	}

	for (const [key, entry] of configEntries) {
		if (entry === null) {
			if (fallbackKey !== undefined) {
				throw new Error(`cannot have multiple fallback slots. found: ${fallbackKey}, ${key}`);
			}
			fallbackKey = key;
		} else if (isOneOf(entry)) {
			entry.oneOf.forEach(addEntry);
		} else if (isManyOf(entry)) {
			entry.manyOf.forEach(addEntry);
		} else {
			throw new Error(`invalid slot config value: ${key} (${entry})`);
		}
	}

	const slots: Record<string, React.ReactNode> = {};
	const childrenArray = React.Children.toArray(children).filter((child) => React.isValidElement(child));

	for (const [key, entry] of configEntries) {
		if (entry === null) {
			slots[key] = childrenArray.filter((child) =>
				typeof child.type === "string" ? !tags.has(child.type) : components.has(child.type)
			);
		} else if (isOneOf(entry)) {
			const c = childrenArray.filter((child) => entry.oneOf.some((e) => child.type === e));
			if (c.length === 1) {
				slots[key] = c[0];
			} else if (c.length > 1) {
				throw new Error(`expected zero or one element for slot ${key}, found ${c.length}`);
			}
		} else if (isManyOf(entry)) {
			const c = childrenArray.filter((child) => entry.manyOf.some((e) => child.type === e));
			if (c.length) {
				slots[key] = c;
			}
		} else {
			throw new Error("unreachable");
		}
	}

	return slots as Slots<Config>;
}

// deno-lint-ignore no-explicit-any
export type SlotsConfigItem = string | React.JSXElementConstructor<any>;

export type SlotsConfigOneOf = { oneOf: Array<SlotsConfigItem> };
export type SlotsConfigManyOf = { manyOf: Array<SlotsConfigItem> };
export type SlotsConfig = Record<string, null | SlotsConfigOneOf | SlotsConfigManyOf>;

// deno-lint-ignore no-explicit-any
type NonRecursiveReactNode = Exclude<Awaited<React.ReactNode>, Iterable<any>>;

export type Slots<Config extends SlotsConfig> = {
	[K in keyof Config]?: Config[K] extends SlotsConfigManyOf ? Array<NonRecursiveReactNode> : NonRecursiveReactNode;
};

type SetValue<S> = S extends Set<infer T> ? T : S extends WeakSet<infer T> ? T : never;
