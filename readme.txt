****************** Developing the App ******************

Create a Node.js project using Express.js for a web application which can service HTTP requests. 

	npm init
	npm install express

The sample app does sentiment analysis and swear word screening for which the following packages can be installed
	npm install natural sentiment bad-words

The Jest testing framework can also be installed 
	npm install --save-dev jest

To document the API using OpenAPI specifications (Swagger), the following packages can be installed
	npm install swagger-ui-express swagger-jsdoc

Ensure the following:
	- The routes, controllers, and tests are isolated in separate folders as in the sample project
	- All relevant routes are documented using the OpenAPI standards

To launch the web app locally, head to the root directory (containing the package.json) in your shell and run:
	npm start

To run tests, run:
	npm test

In the sample app, the API docs can be accessed via a browser at http://localhost:3000/api-docs

Use a tool such as Postman to submit a POST request to trigger the text processing
	- The URL will be http://localhost:3000/api/check-text
	- In the headers, include {Key: Content-Type, Value: application/json}
	- In the body, submit a JSON object with a single text field:

{"text": "It's a damn shame. They were so promising, but could not live up to the hype."}


****************** Containerizing (Dockerizing) the App ******************

This assumes you have Docker Desktop on your machine and that you have a Docker Hub account where an image can be pushed.

Define a Dockerfile with which to build an image for the app.
	- Refer to Dockerfile

Build a Docker image from the file (using docker build or using any UI-based tool).

Push the image to a repo Docker registry (e.g. Docker Hub).

Run the container locally to ensure it works.



****************** Setting Up a Kubernetes Cluster on the Azure Cloud ******************

Provision an Azure Resource Group for all the resources needed for the app and its infrastructure. All of the below resources will be provisioned in this resource group.
Pick a region for all of the resources below to be provisioned.

Create a Network Security Group (NSG) and configure it according to the rules listed here:
https://learn.microsoft.com/en-us/azure/api-management/api-management-using-with-vnet?tabs=stv2#configure-nsg-rules
	- Refer to azure_configs/nsg_config.json

Create a VNet and apply the above NSG to the default subnet
Optionally, create a separate subnet in the VNet for the AKS cluster which will need to be created
	- Refer to azure_configs/vnet_config.json

Provision an AKS cluster (Kubernetes Cluster):
	- Set the resource group, region etc. to match the NSG and VNet
	- Add node pools as needed. A default node pool is enough to get started.
	- Under Networking --> Network Configuration, set it to Azure CNI
		- Set the Virtual Network to the VNet provisioned above
		- Pick the default or alternate subnet as the Cluster Subnet
		- Set any appropriate value for the DNS Name Prefix (e.g. texteval)
	- Head to Review+Create and then create the AKS Cluster

Configure the AKS Cluster:
	- Apply the ConfigMap to set the NODE_ENV variable. This will be used by the Deployment later to prevent development dependencies from running in a Production setup.
		- Refer to kubernetes_configs/configmap.yaml
	- Apply the Deployment for the app to the AKS cluster
		- Refer to kubernetes_configs/texteval-deployment.yaml
	- Create a ClusterIP service for the deployment
		- Refer to kubernetes_configs/texteval-service.yaml



****************** Provision and Configure an Ingress to the Kubernetes Cluster ******************

Set up the Ingress Controller and Ingress to access the service (Reference documentation: https://learn.microsoft.com/en-us/azure/aks/ingress-basic)
	- Pull up the Azure CLI and connect to your AKS cluster:

	az aks get-credentials --resource-group <resource_group_name> --name <aks_cluster_name>

	- Use Helm (a Kubernets package manager) to set up the ingress-nginx repo:

	helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
	helm repo update

	- Create an ingress controller as an internal load balancer: 

	helm install ingress-nginx ingress-nginx/ingress-nginx \
	  --namespace default \
	  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-internal"=true \
	  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz

	 - Note that the "External IP" which shows up for the ingress controller is not in fact external. Make a note of the ClusterIP and/or "External IP" which appear - these will be used later as the backend of an API defined in Azure API Management.

	 - Configure an ingress which will direct requests to the ClusterIP service we created earlier for our app
	 	- Refer to kubernetes_configs/texteval-ingress.yaml


****************** Create an API Management Instance to Serve as the Gateway to the App ******************

Create a new Public IP address on Azure
	- Ensure that this IP address has a DNS name label configured - this is needed for the API Management instance

Create a new API Management service on Azure:
	- The resource group and region should match the ones used so far
	- Under Virtual Network, set the "Connectivity type" to Virtual Network
	- Set the type to External 
	- For the Virtual network, point to the previously provisioned virtual network
	- For the subnet, we can use either of the two subnets provisioned earlier. For better isolation, use a different subnet than what was used for the AKS cluster.
	- For the Public IP address, point to the one created earlier
	- For the protocol, enable all that apply
	- Choose Review+install and create the gateway (this can take over an hour)

Create a new API in the API Management instance:
	- Choose to manually create an HTTP API
	- Set any appropriate name for the service
	- For the service URL set it to http://<ip_of_ingress_controller>/api (either the ClusterIP or "External IP" will work)
	- For the front end, configure a POST request with the suffix "check-text"
	- Ensure that a subscription key is required for the POST request
	- Include a sample request and test it out within the UI
	- Note the URL of the POST request made - we will use it externally next

Test calls to the app via API Management
	- Create a new API key for the APIM instance. Copy down the principal key - this will be used soon when sending a POST request.
	- From Postman (or equivalent REST client), create a POST request
	- The URL will be https://<url_of_apim_instance>/check-text
	- The headers will include the subscription key in addition to the Content-Type:
	[{Key: Content-Type, Value: application/json}, {Key: Ocp-Apim-Subscription-Key, Value: <subscription-key>}]
	- Send the POST request - the expected data should be returned


