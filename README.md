# react-slots

a tiny helper function to create simple slots

## usage

```tsx
import React from "react";
import { makeSlots } from "@niyrme/react-slots";

// whatever slots you need
const SlotA: React.FC<{ children: React.ReactNode }> = (props) => (<React.Fragment {...props} />);
const SlotB: React.FC<{ children: React.ReactNode }> = (props) => (<React.Fragment {...props} />);

const MyComponent: React.FC<{ children: React.ReactNode }> = (props) => {
	// using capitalized keys makes it possible to render the slots directly
	// instead of having to wrap them into fragments (`<>{slots.MySlotA}</>`)
	const slots = makeSlots(props.children, {
		// accepts zero or one of type `SlotA`
		MySlotA: { oneOf: [SlotA] },
		// accepts zero or many of type `SlotB`
		MySlotB: { manyOf: [SlotB] },
		// accepts zero or many of `h1` and `h2`
		Headings: { manyOf: ["h1", "h2"] },
		// accepts anything that did not match any defined tag/component
		Content: null,
	});

	return (
		<>
			<slots.MySlotA />
			<div>
				<slots.Content />
			</div>
		</>
	);
}

MyComponent.SlotA = SlotA;
MyComponent.SlotB = SlotB;

export default MyComponent;
export {
	SlotA,
	SlotB,
};
```

---

## License
MIT
