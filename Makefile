all: install-client install-server build-client build-server format test
install: install-client install-server
	pip install pytest
build-client:
	cd policyengine-client; npm run build
build-server:
	cd policyengine; rm -rf build/ dist/ policyengine.egg-info; python setup.py sdist bdist_wheel
install-client:
	cd policyengine-client; npm install
install-server:
	pip install git+https://github.com/PolicyEngine/OpenFisca-UK@policyengine-consolidation
	pip install -e .
publish-server: policyengine
	twine upload policyengine/dist/* --skip-existing
publish-client:
	cd policyengine-client; npm publish
debug-server:
	FLASK_APP=policyengine/server.py FLASK_DEBUG=1 flask run
debug-client:
	cd policyengine-client; npm start
format:
	autopep8 policyengine -r -i
	autopep8 main.py setup.py -i
	black policyengine -l 79
	black . -l 79
test:
	pytest policyengine/tests -vv
datasets:
	openfisca-uk-setup --set-default frs_was_imp
	openfisca-uk-data frs_was_imp download 2019
deploy: install-server test datasets
	rm -rf policy_engine_uk/static
	cd client; npm run build
	cp -r client/build policy_engine_uk/static
	y | gcloud app deploy
test-deploy: install-server test datasets
	rm -rf policy_engine_uk/static
	cd client; npm run build
	cp -r client/build policy_engine_uk/static