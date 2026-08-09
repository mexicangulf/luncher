<script lang="ts">

    import {onMount} from 'svelte';
    import {io, Socket} from "socket.io-client";

    let log = $state("");
    const {data} = $props();

    async function authenticate(socket: Socket, token: string) {
        return new Promise((resolve, reject) => {
            socket.emit("auth", token, (res: any) => {
                resolve(res.success);
            });
        });
    }

    async function setGame(socket: Socket, gameId: string) {
        return new Promise((resolve, reject) => {
            socket.emit("set_game", gameId, (res: any) => {
                resolve(res.success);
            });
        });
    }

    async function ready(socket: Socket) {
        return new Promise((resolve, reject) => {
            socket.emit("ready", "", (res: any) => {
                resolve(res.success);
            });
        });
    }

    onMount(async () => {
        
        const user = data.user;
        const gameid = data.gameid;

        console.log(user, gameid);

        if(!user) {
            window.location.href = "/404";
        }

        const socket = io(data.service);

        // retry this in a loop every 2 seconds for 5 times
        log += "connecting to matchmaking server\n";
        let ok = await authenticate(socket, data.token!);
        log += "connected to matchmaking server\n";
        ok = await setGame(socket, gameid);
        log += "searching for free lobby\n";
        
        socket.on("table_full", ({tableId, ok}) => {
            localStorage.setItem("access_token", JSON.stringify(data.token));
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("match_id", tableId);
            window.location.href = `/play/${gameid}`;
        });
        
        ok = await ready(socket);

    });

</script>

<div>
    {#each log.split("\n") as line}
        <p>{line}</p>
    {/each}
</div>