export default async function CreateTree(year, month, parentId) {
	const data = await dashboardService.getUserDashboardByParentId(
		year,
		month,
		parentId
	);
	const stack = [];
	let lastParentId = data[data.length - 1].parentId;
	for (let i = data.length - 1; i >= 0; i--) {
		node = { ...data[i], children: [] };
		if (lastParentId === data[i].userId) {
			while (
				stack.length > 0 &&
				stack[stack.length - 1].parentId === node.userId
			) {
				child = stack.pop();
				node.children.push(child);
			}
		}
		stack.push(node);
		lastParentId = data[i].parentId;
	}
	return stack;
}
