<script>

    import {onMount} from 'svelte';
    const { user } = $props();

    onMount(async () => {

        if(user) {
            return;
        }
        
        try {

            const result = await fetch('/api/auth/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    initData: window.Telegram.WebApp.initData
                })
            });

            console.log(result.ok);

        } catch (error) {
            console.error("failed to authenticate with telegram", error);
        }

    });

</script>

<h1>Welcome to Bazzi</h1>