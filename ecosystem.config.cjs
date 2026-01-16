module.exports = {
    apps: [
        {
            name: "arang-blog",
            script: "npm",
            args: "start",
            cwd: "/home/arang/web/blog",
            interpreter: "none",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
        },
    ],
};
