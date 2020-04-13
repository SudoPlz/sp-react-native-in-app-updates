require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "sp-react-native-in-app-updates"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  sp-react-native-in-app-updates
                   DESC
  s.homepage     = "https://github.com/github_account/sp-react-native-in-app-updates"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Ioannis Kokkinidis" => "sudoplz@gmail.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/github_account/sp-react-native-in-app-updates.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  # ...
  # s.dependency "..."
end

