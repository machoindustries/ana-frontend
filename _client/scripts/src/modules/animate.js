import velocity from 'velocity-animate';

export default function (el, props, opts, ctx) {

    return new Promise((resolve/* , reject */) => {

        velocity(el, props, Object.assign(opts, { complete () {
            resolve(ctx || this);
        } }));
    });
}