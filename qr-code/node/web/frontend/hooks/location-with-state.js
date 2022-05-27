import { useNavigate as originalUseNavigate} from "@shopify/app-bridge-react";
import { useLocation as originalUseLocation} from "react-router-dom";

/**
 * These are two small wrappers to add the ability to pass state along with a
 * navigation. React-Router can already do that, but AppBridge’s `useNavigate()`
 * does not.
 */

let state = undefined;
export function useNavigate() {
	const navigate = originalUseNavigate();
	return (target, opts) => {
		state = opts?.state;
		navigate(target, opts);
	};
}

export function useLocation() {
	const location = originalUseLocation();
	location.state = state;
	return location;
}