type KalmanOptions = {
	/** Measurement noise variance */
	R: number;
	/** Process noise variance */
	Q: number;
	/** Initial estimate covariance */
	P0?: number;
};

/**
 * Minimal 1D Kalman filter for a random-walk model.
 * Accepts missing observations as `null`.
 */
export function kalmanFilter1D(
	observations: (number | null)[],
	options: KalmanOptions,
): (number | null)[] {
	const { R, Q, P0 = 1 } = options;

	let x: number | null = null;
	let P = P0;

	const out: (number | null)[] = new Array(observations.length).fill(null);

	for (let i = 0; i < observations.length; i++) {
		const z = observations[i];

		// If we haven't initialized yet, start from first non-null observation.
		if (x === null) {
			if (z === null) {
				out[i] = null;
				continue;
			}
			x = z;
			P = P0;
			out[i] = x;
			continue;
		}

		// Predict
		// x = x (random walk)
		P = P + Q;

		// Update (if measurement exists)
		if (z !== null) {
			const K = P / (P + R);
			x = x + K * (z - x);
			P = (1 - K) * P;
		}

		out[i] = x;
	}

	return out;
}
