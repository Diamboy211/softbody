class Point
{
	constructor(x, y, dt)
	{
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.a1x = 0; // current accel 
		this.a1y = 0;
		this.a2x = 0; // prev accel
		this.a2y = 0;
		this.a3x = 0; // prev prev accel
		this.a3y = 0;
		this.dt = dt;
	}

	apply_force(fx, fy)
	{
		this.a1x += fx;
		this.a1y += fy;
	}

	update()
	{
		let a1x = this.a1x;
		let a1y = this.a1y;
		let a2x = this.a2x;
		let a2y = this.a2y;
		let a3x = this.a3x;
		let a3y = this.a3y;
		let dt = this.dt;
		this.x += this.vx * dt + a1x * dt * dt * 0.5; // wtf why did the math work out like this
		this.y += this.vy * dt + a1y * dt * dt * 0.5;
		this.vx += (1.75 * a1x - a2x + 0.75 * a3x) * dt;
		this.vy += (1.75 * a1y - a2y + 0.75 * a3y) * dt;
		this.a3x = a2x;
		this.a3y = a2y;
		this.a2x = a1x;
		this.a2y = a1y;
		this.a1x = 0.0;
		this.a1y = 0.0;
	}
	constrain()
	{
		if (this.y > 600)
		{
			this.y = 600;
			this.vx = 0.0;
			this.vy = 0.0;
		}
	}
}

class Spring
{
	constructor(b1, b2, s)
	{
		this.b1 = b1;
		this.b2 = b2;
		this.l = Math.hypot(b2.x - b1.x, b2.y - b1.y);
		this.s = s;
	}
	update_force()
	{
		let cl = Math.hypot(this.b2.x - this.b1.x, this.b2.y - this.b1.y);
		let dl = cl - this.l;
		let il = 1.0 / cl;
		let nx = (this.b2.x - this.b1.x) * il;
		let ny = (this.b2.y - this.b1.y) * il;
		this.b1.apply_force(nx * this.s * dl, ny * this.s * dl);
		this.b2.apply_force(nx * this.s * -dl, ny * this.s * -dl);
	}
}

class Physics_Object
{
	constructor()
	{
		this.p = [];
		this.s = [];

		this.im = 1.0;
		this.m = 1.0;

		this.ax = 0.0;
		this.ay = 0.0;

	}
	add_point(p)
	{
		this.p.push(p);
	}
	add_spring(p1, p2, s)
	{
		this.s.push(new Spring(p1, p2, s));
	}
	update_cache() { this.im = 1.0 / this.p.length; this.m = this.p.length; }
	apply_force(x, y)
	{
		this.ax += x;
		this.ay += y;
	}
	update_force()
	{
		for (let p of this.p)
			p.apply_force(this.ax * this.im, this.ay * this.im);
		this.ax = 0.0;
		this.ay = 0.0;
		for (let s of this.s)
			s.update_force();
	}
	update()
	{
		for (let p of this.p)
			p.update();
	}
	get rect()
	{
		let a = this.p.reduce((a, c) => Math.min(a, c.x), Infinity);
		let b = this.p.reduce((a, c) => Math.max(a, c.x), -Infinity);
		let c = this.p.reduce((a, c) => Math.min(a, c.y), Infinity);
		let d = this.p.reduce((a, c) => Math.max(a, c.y), -Infinity);
		return { x: a, y: c, w: b - a, h: d - c };
	}
	contains(x, y)
	{
		let c = 0;
		let j = this.p.length - 1;
		for (let i = 0; i < this.p.length; i++)
		{
			let p1 = this.p[j];
			let p2 = this.p[i];
			let x1 = p1.x - x;
			let x2 = p2.x - x;
			let y1 = p1.y - y;
			let y2 = p2.y - y;
			if (y1 != 0.0 || y2 != 0.0)
			{
				if (y1 * y2 <= 0.0)
				{
					let t = y1 / (y1 - y2);
					let xi = x1 + (x2 - x1) * t;
					if (xi >= 0.0) c++;
				}
			}
			j = i;
		}
		return c % 2 == 1;
	}
	collide(o)
	{
		let r1 = this.rect;
		let r2 = o.rect;
		if (
			r1.x + r1.w <= r2.x
			&& r1.y + r1.h <= r2.y
			&& r1.x >= r2.x + r2.w
			&& r1.y >= r2.y + r2.h
		) return;
		let p = o.p.filter(a => this.contains(a.x, a.y));
		let q = p.map(a => {
			let j = this.p.length - 1;
			let k1 = j, k2 = 0, md = Infinity, mt = 0.5;
			for (let i = 0; i < this.p.length; i++)
			{
				let p1 = this.p[j];
				let p2 = this.p[i];
				let r1x = a.x - p1.x;
				let r1y = a.y - p1.y;
				let r2x = p2.x - p1.x;
				let r2y = p2.y - p1.y;
				let t = (r1x*r2x + r1y*r2y) / (r2x*r2x + r2y*r2y);
				t = Math.max(0, Math.min(1, t));
				let px = r2x * t;
				let py = r2y * t;
				let d = Math.hypot(px - r1x, py - r1y);
				if (md > d)
				{
					k1 = j;
					k2 = i;
					md = d;
					mt = t;
				}
				j = i;
			}
			return { a: this.p[k1], b: this.p[k2], d: md, t: mt };
		});
		for (let i = 0; i < p.length; i++)
		{
			let a = p[i];
			let b = q[i];
			let nx = b.b.y - b.a.y;
			let ny = b.a.x - b.b.x;
			let d = Math.hypot(nx, ny);
			nx /= d;
			ny /= d;
			a.x += nx * d * 0.1;
			a.y += ny * d * 0.1;
			b.a.x += nx * d * -0.1 * (1 - b.t);
			b.a.y += ny * d * -0.1 * (1 - b.t);
			b.b.x += nx * d * -0.1 * b.t;
			b.b.y += ny * d * -0.1 * b.t;
			
			let vax = a.vx;
			let vay = a.vy;
			let vbx = (b.a.vx + b.b.vx) * 0.5;
			let vby = (b.a.vy + b.b.vy) * 0.5;

			let at = vax * nx + vay * ny;
			let bt = vbx * nx + vby * ny;

			a.vx -= nx * at;
			a.vy -= ny * at;

			b.a.vx -= nx * bt;
			b.a.vy -= ny * bt;
			b.b.vx -= nx * bt;
			b.b.vy -= ny * bt;
		}
	}
	get cx() { return this.p.reduce((a, c) => a + c.x, 0) / this.p.length; }
	get cy() { return this.p.reduce((a, c) => a + c.y, 0) / this.p.length; }
}

class Physics_Inflated_Object extends Physics_Object
{
	constructor()
	{
		super();
		this.gas = 0.0;
	}
	update_force()
	{
		for (let p of this.p)
			p.apply_force(this.ax * this.im, this.ay * this.im);
		this.ax = 0.0;
		this.ay = 0.0;
		let v = this.volume;
		let d = this.gas * this.gas / v - this.gas;
		const inflate_strength = 0.005;
		let j = this.p.length - 1;
		for (let i = 0; i < this.p.length; i++)
		{
			let p1 = this.p[j];
			let p2 = this.p[i];
			let nx = p2.y - p1.y;
			let ny = p1.x - p2.x;
			p1.apply_force(nx * d * inflate_strength, ny * d * inflate_strength);
			p2.apply_force(nx * d * inflate_strength, ny * d * inflate_strength);
			j = i;
		}
		for (let s of this.s)
			s.update_force();
	}
	get volume()
	{
		if (this.p.length < 3) return 0.0;
		let v = 0.0;
		let l = this.p.length - 1;
		for (let i = 1; i < this.p.length - 2; i++)
		{
			v += (this.p[i].x - this.p[i+2].x) * (this.p[i+1].y - this.p[0].y);
		}
		v -= (this.p[2].x - this.p[0].x) * (this.p[1].y - this.p[0].y);
		v += (this.p[l-1].x - this.p[0].x) * (this.p[l].y - this.p[0].y);
		return v * 0.5;
	}
}