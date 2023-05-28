function main()
{
	const iters = 128;
	const frame_time = 0.03;
	let canvas = document.getElementById("c");

	let ctx = canvas.getContext("2d", { willReadFrequently: true });
	let w = canvas.width;
	let h = canvas.height;

	let o = [];

	for (let g = 0; g < 16; g++)
	{
		const v = 10;
		let b = new Physics_Inflated_Object();
		for (let i = 0; i < v; i++)
			b.add_point(new Point(100 + (g%4)*100 + 10 * Math.cos(i/v*2*Math.PI+g), 100 + g*25 + 10 * Math.sin(i/v*2*Math.PI+g), frame_time / iters));
		for (let h of [1, 2])
			for (let i = 0; i < v; i++)
				b.add_spring(b.p[i], b.p[(i+h)%v], 128.0);
		b.update_cache();
		b.gas = 4000;
		o.push(b);
	}

	let img_data = ctx.createImageData(w, h);
	let img_buf = new Array(w*h);

	let mdx = 0;
	let mdy = 0;
	let mmx = 0;
	let mmy = 0;
	let md = 0;
	let mr = 0;
	canvas.addEventListener("mousedown", e =>
	{
		mdx = mmx = e.clientX;
		mdy = mmy = e.clientY;
		md = e.buttons & 1;
		mr = (e.buttons & 2) >> 1;
		e.preventDefault();
		return false;
	});
	canvas.addEventListener("mouseup", e =>
	{
		mmx = e.clientX;
		mmy = e.clientY;
		md = e.buttons & 1;
		mr = (e.buttons & 2) >> 1;
		e.preventDefault();
		return false;
	});
	canvas.addEventListener("mousemove", e => { mmx = e.clientX; mmy = e.clientY; });
	(function loop()
	{
		requestAnimationFrame(loop);

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, w, h);

		ctx.fillStyle = "#FFF";
		for (let i = 0; i < iters; i++)
		{
			for (let a of o)
				a.apply_force(0, 16*a.m);
			if (md) o[0].apply_force(o[0].m*(mmx-o[0].cx), o[0].m*(mmy-o[0].cy));
			if (mr) o[1].apply_force(o[1].m*(mmx-o[1].cx), o[1].m*(mmy-o[1].cy));
			const f = 0.3;
			for (let a of o)
				for (let p of a.p)
					p.apply_force(-p.vx * f, -p.vy * f);
			for (let a of o)
				a.update_force();
			for (let a of o)
				a.update();
			for (let a of o)
				for (let p of a.p)
					p.constrain();
			for (let i = 0; i < o.length; i++)
				for (let j = 0; j < o.length; j++)
					if (i != j) o[i].collide(o[j]);
		}

		ctx.strokeStyle = "#FFF";
		ctx.beginPath();
		for (let a of o)
		{
			if (a instanceof Physics_Inflated_Object)
			{
				let j = a.p.length - 1;
				ctx.moveTo(a.p[j].x, a.p[j].y);
				for (let i = 0; i < a.p.length; i++)
				{
					ctx.lineTo(a.p[i].x, a.p[i].y);
					j = i;
				}
			}
		}
		ctx.stroke();
		for (let a of o)
			for (let p of a.p)
				ctx.fillRect(p.x-1, p.y-1, 2, 2);
		
		let img_data = ctx.getImageData(0, 0, w, h);
		ctx.putImageData(img_data, 0, 0);
	})();
}

main();
