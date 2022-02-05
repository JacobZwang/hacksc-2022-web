<script>
    import {io } from 'socket.io-client';
   const client =  io('http://localhost:420');
   client.connect();
   client.onAny(function(event,data){
       console.log("Data",event,data);
   });
</script>
<h1>Header</h1>
