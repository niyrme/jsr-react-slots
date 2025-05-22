[![JSR](https://jsr.io/badges/@niyrme/react-slots)](https://jsr.io/@niyrme/react-slots)

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
	const slots = makeSlots(props.children, {
		// accepts zero or one of type `SlotA`
		mySlotA: { oneOf: [SlotA] },
		// accepts zero or many of type `SlotB`
		mySlotB: { manyOf: [SlotB] },
		// accepts zero or many of `h1` and `h2`
		headings: { manyOf: ["h1", "h2"] },
		// accepts anything that did not match any defined tag/component
		children: null,
	});

	return (
		<>
			{slots.mySlotA}
			<div>
				{slots.children}
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
