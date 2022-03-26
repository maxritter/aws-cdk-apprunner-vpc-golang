package types

type RDSDatabaseSecret struct {
	Cluster  string `json:"dbClusterIdentifier"`
	Password string `json:"password"`
	Engine   string `json:"engine"`
	Port     int    `json:"port"`
	Host     string `json:"host"`
	Username string `json:"username"`
}
