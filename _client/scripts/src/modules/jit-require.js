import $ from 'jquery';

export default function (container) {

    Promise.all($(container).find('[data-require]').toArray().map((el) => {

        return new Promise((resolve, reject) => {

            const $el = $(el),
                data = $el.data(),
                ref = data.require;

            loadjs([ref], (mod) => {

                if (mod) {

                    const instance = mod.default();
                    console.log('Loaded ', instance, ' from path ', ref);
                    instance.init($el, data);

                    resolve(instance);
                }
                else {

                    reject(`Failed to load module ${ ref }`);
                }
            });

        });

    })).then((modules) => {

        console.log(`Loaded ${ modules.length } module(s).`);

    }).catch((err) => {

        console.log(err);
    });
}