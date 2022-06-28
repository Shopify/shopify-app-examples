const config = {
  test: {
    globals: true,
    exclude: ["./frontend/**", "./node_modules/**"],
    setupFiles: "./__tests__/setup.js",
  },
};

export default config;
