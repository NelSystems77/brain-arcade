// Build / dev server con esbuild. Sin config extra: `npm run build` o `npm run dev`.
import esbuild from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';

const serve = process.argv.includes('--serve');
const OUTDIR = 'dist';

/** Copia el HTML (y cualquier estático futuro) al outdir tras cada build. */
const copyStatic = {
    name: 'copy-static',
    setup(build) {
        build.onEnd((result) => {
            if (result.errors.length) return;
            mkdirSync(OUTDIR, { recursive: true });
            cpSync('src/index.html', `${OUTDIR}/index.html`);
        });
    },
};

/** @type {import('esbuild').BuildOptions} */
const options = {
    entryPoints: { app: 'src/js/main.js' },
    bundle: true,
    minify: !serve,
    sourcemap: serve,
    target: ['es2020'],
    format: 'iife',
    outdir: OUTDIR,
    loader: { '.svg': 'dataurl', '.png': 'file' },
    plugins: [copyStatic],
    logLevel: 'info',
};

rmSync(OUTDIR, { recursive: true, force: true });

if (serve) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    const { port } = await ctx.serve({ servedir: OUTDIR, port: 5173 });
    console.log(`\n  BrainArcade  →  http://localhost:${port}\n`);
} else {
    await esbuild.build(options);
    console.log(`\n  Build listo en ./${OUTDIR}\n`);
}
