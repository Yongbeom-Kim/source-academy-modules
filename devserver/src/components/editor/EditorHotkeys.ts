export const keyBindings = {
	evaluate: {
		win: "Shift-Enter",
		mac: "Shift-Enter"
	},
	navigate: {
		win: "Ctrl-B",
		mac: "Command-B"
	},
	refactor: {
		win: "Ctrl-M",
		mac: "Command-M"
	},
	highlightScope: {
		win: "Ctrl-Shift-H",
		mac: "Command-Shift-H"
	},
	typeInferenceDisplay: {
		win: "Ctrl-Shift-M",
		mac: "Command-Shift-M"
	}
};

export type KeyFunction = keyof typeof keyBindings;
