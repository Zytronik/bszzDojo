<section>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<h2>App Aktualisieren</h2>
				<button id="updateAppButton">App aktualisieren</button>
			</div>
		</div>
	</div>
	<script>
		document.getElementById("updateAppButton").addEventListener("click", async function() {
			if (confirm("Möchtest du die App aktualisieren?")) {
				await clearCache();
				await unregisterServiceWorker();
				window.location.reload();
			}
		});

		async function clearCache() {
			if ('caches' in window) {
				const cacheNames = await caches.keys();
				for (const cacheName of cacheNames) {
					await caches.delete(cacheName);
				}
				console.log('Cache cleared.');
			}
		}

		async function unregisterServiceWorker() {
			if ('serviceWorker' in navigator) {
				const registrations = await navigator.serviceWorker.getRegistrations();
				for (const registration of registrations) {
					await registration.unregister();
				}
				console.log('Service Worker unregistered.');
			}
		}
	</script>
</section>