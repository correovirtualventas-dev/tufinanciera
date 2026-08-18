const { bcraService } = require('./src/services/bcra.service');
(async () => {
  const r = await bcraService.checkBcra('29889234');
  console.log(JSON.stringify(r, null, 1));
})();