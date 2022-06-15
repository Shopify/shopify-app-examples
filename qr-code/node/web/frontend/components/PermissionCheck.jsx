import { useNavigate } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useAppQuery} from "../hooks";

export function PermissionCheck() {
	const navigate = useNavigate();

	const {
    data,
    isLoading,
		error
  } = useAppQuery({
    url: '/api/graphql',
		fetchInit: {
			method: "POST",
			headers: {
				"Content-Type": "application/graphql",
			},
			body: `
				{
					products(first: 1) {
						edges {
							node {
								id
							}
						}
					}
				}
			`
		}
  });

	useEffect(() => {
		if(isLoading) return;
		if(error || data?.errors) {
			navigate("/gqlproducterror");
			return;
		}
	}, [isLoading, error, data]);
	return null;
}