from setuptools import setup, find_packages
from policyengine import VERSION

setup(
    name="PolicyEngine",
    version=VERSION,
    author="PolicyEngine",
    license="http://www.fsf.org/licensing/licenses/agpl-3.0.html",
    url="https://github.com/policyengine/policyengine",
    install_requires=[
        "OpenFisca-UK==0.17.0",
        "OpenFisca-US==0.40.0",
        "OpenFisca-Tools>=0.7.2",
        "plotly",
        "flask",
        "itsdangerous==2.0.1",
        "flask_cors",
        "kaleido",
        "google-cloud-storage>=1.42.0",
        "gunicorn",
        "OpenFisca-Core",
        "microdf_python",
        "numpy",
        "pandas",
        "tables",
        "wheel",
        "rdbl",
        "pytest",
        "dpath>=1.5.0",
        "yaml-changelog>=0.1.5",
        "Jinja2==3.0.3",
        "dpath<2.0.0,>=1.5.0",
    ],
    packages=find_packages(),
)
