<nav>
	<ul>
		<li><a href="/">Home</a></li>
		<li><a href="/videos">Videos</a></li>
	</ul>
</nav>

<main>
	<slot />
</main>

<style>
	nav {
		background-color: #333333;
		color: #fff;
		display: flex;
		height: 100px;
	}

	nav ul {
		display: flex;
		flex: 1;
		justify-content: center;
		align-items: center;
		list-style: none;
		gap: 8px;
		margin: 0;
		padding: 0;
	}

	nav ul li a {
		padding: 10px 20px;
		color: #000000;
		display: block;
		background-color: #ffffff;
		text-decoration: none;
		font-weight: bold;
	}

	nav ul li a:hover {
		color: #ffffff;
		background-color: var(--color-primary);
	}
</style>
