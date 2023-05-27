function main()
{
	const iters = 256;
	let canvas = document.getElementById("c");
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

	let ctx = canvas.getContext("2d");
	let w = canvas.width;
	let h = canvas.height;

	let p = [];
	let s = [];

	let px = 10, py = 10;

	for (let i = 0; i < py; i++)
		for (let j = 0; j < px; j++)
		{
			let x = (j+i) * (200 / (px-1)) + 200;
			let y = (j-i) * (200 / (py-1)) + 200;
			p.push(new Ball(x, y, 1, 0.03 / iters));
		}

	for (let i = 0; i < py; i++)
		for (let j = 0; j < px-1; j++)
			s.push(new Spring(p[i*px+j], p[i*px+j+1], 128.0));
	for (let i = 0; i < py-1; i++)
		for (let j = 0; j < px; j++)
			s.push(new Spring(p[i*px+j], p[i*px+j+px], 128.0));
	for (let i = 0; i < py-1; i++)
		for (let j = 0; j < px-1; j++)
		{
			s.push(new Spring(p[i*px+j], p[i*px+j+px+1], 128.0));
			s.push(new Spring(p[i*px+j+1], p[i*px+j+px], 128.0));
		}

	let img_data = ctx.createImageData(w, h);
	let img_buf = new Array(w*h);

	(function loop()
	{
		requestAnimationFrame(loop);

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, w, h);

		ctx.fillStyle = "#FFF";
		for (let i = 0; i < iters; i++)
		{
			for (let q of p)
			{
				let f = 0.1;
				q.apply_force(0, 16*q.m);
				q.apply_force(-q.vx * f, -q.vy * f);
			}
			for (let q of s)
				q.apply_force();
			for (let q of p)
				q.update();
			for (let q of p)
				q.constrain();
		}
		/*
		for (let i = 0; i < w*h; i++)
			img_buf[i] = 0;
		for (let q of p)
		{
			let px = Math.floor(q.x - 0.5);
			let py = Math.floor(q.y - 0.5);
			let fx = q.x - 0.5 - px;
			let fy = q.y - 0.5 - py;

			if (py >= 0 && py < h)
			{
				if (px >= 0 && px < w)
					img_buf[py*w+px] += (1-fx)*(1-fy);
				if (px+1 >= 0 && px+1 < w)
					img_buf[py*w+px+1] += fx*(1-fy);
			}
			if (py+1 >= 0 && py+1 < h)
			{
				if (px >= 0 && px < w)
					img_buf[py*w+px+w] += (1-fx)*fy;
				if (px+1 >= 0 && px+1 < w)
					img_buf[py*w+px+w+1] += fx*fy;
			}
		}
		for (let i = 0; i < w*h; i++)
		{
			let a = Math.sqrt(img_buf[i]) * 255;
			img_data.data[i*4] = a;
			img_data.data[i*4+1] = a;
			img_data.data[i*4+2] = a;
			img_data.data[i*4+3] = 255;
		}
		ctx.putImageData(img_data, 0, 0);
		*/
		ctx.strokeStyle = "#FFF";
		ctx.beginPath();
		for (let q of s)
		{
			ctx.moveTo(q.b1.x, q.b1.y);
			ctx.lineTo(q.b2.x, q.b2.y);
		}
		ctx.stroke();
		for (let q of p)
			ctx.fillRect(q.x-0.5, q.y-0.5, 1, 1);

	})();
}

main();
