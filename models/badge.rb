require 'mongoid'

class Badge
  include Mongoid::Document

  belongs_to :group
  belongs_to :student

  field :type, :type => String
  field :label, :type => String
  field :avatar, :type => String
end