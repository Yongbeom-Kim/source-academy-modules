import { AnchorButton, Button, Icon, type IconName, Intent } from "@blueprintjs/core";
import React from "react";

type ButtonOptions = {
  className: string;
  fullWidth: boolean;
  iconColor?: string;
  iconOnRight: boolean;
  intent: Intent;
  minimal: boolean;
  type?: "submit" | "reset" | "button";
};

type ControlButtonProps = {
  label?: string;
  icon?: IconName;
  onClick?: () => void;
  options?: Partial<ButtonOptions>;
  isDisabled?: boolean;
};

const defaultOptions = {
	className: "",
	fullWidth: false,
	iconOnRight: false,
	intent: Intent.NONE,
	minimal: true
};

const ControlButton: React.FC<ControlButtonProps> = ({
	label = "",
	icon,
	onClick,
	options = {},
	isDisabled = false
}) => {
	const buttonOptions: ButtonOptions = {
		...defaultOptions,
		...options
	};
	const iconElement = icon && <Icon icon={icon} color={buttonOptions.iconColor} />;
	// Refer to #2417 and #2422 for why we conditionally
	// set the button component. See also:
	// https://blueprintjs.com/docs/#core/components/button
	const ButtonComponent = isDisabled ? AnchorButton : Button;

	return (
		<ButtonComponent
			disabled={isDisabled}
			fill={buttonOptions.fullWidth}
			intent={buttonOptions.intent}
			minimal={buttonOptions.minimal}
			className={buttonOptions.className}
			type={buttonOptions.type}
			onClick={onClick}
			icon={!buttonOptions.iconOnRight && iconElement}
			rightIcon={buttonOptions.iconOnRight && iconElement}
		>
			{label}
		</ButtonComponent>
	);
};

export default ControlButton;
