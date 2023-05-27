class Ball
{
	constructor(x, y, m, dt)
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
		this.m = m;
		this.im = 1.0 / m;
		this.dt = dt;
	}

	apply_force(fx, fy)
	{
		this.a1x += fx * this.im;
		this.a1y += fy * this.im;
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
			this.vy = 0;
		}
		if (this.y < 0)
		{
			this.y = 0;
			this.vy = 0;
		}
		if (this.x > 600)
		{
			this.x = 600;
			this.vx = 0;
		}
		if (this.x < 0)
		{
			this.x = 0;
			this.vx = 0;
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
	apply_force()
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