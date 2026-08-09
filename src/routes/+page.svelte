<script>

    import {onMount} from 'svelte';
    const { user } = $props();

    let ok = $state(false);

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
            ok = result.ok;
            
        } catch (error) {
            console.error("failed to authenticate with telegram", error);
        }

    });

</script>

<h1>Welcome to Bazzi</h1>

{#if ok}
<a href="/matchmaking/hokm" >play hokm</a>
{/if}